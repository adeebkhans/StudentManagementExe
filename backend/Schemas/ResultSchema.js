const mongoose = require("mongoose");
const { Schema } = mongoose;

const resultSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true
    },
    session: {
        type: String,
        required: true
    },
    year: {
        type: String, // "first" or "second"
        enum: ["first", "second"],
        required: true
    },
    subjects: [
        {
            name: { type: String, required: false },
            marks: {
                ct1: {
                    outOf75: { 
                        type: Number, 
                        required: false, 
                        min: 0, 
                        max: 75 
                    },
                    outOf5: { 
                        type: Number, 
                        required: false, 
                        min: 0, 
                        max: 5 
                    }
                },
                ct2: {
                    outOf75: { 
                        type: Number, 
                        required: false, 
                        min: 0, 
                        max: 75 
                    },
                    outOf5: { 
                        type: Number, 
                        required: false, 
                        min: 0, 
                        max: 5 
                    }
                },
                otherMarks: {
                    assignment: { type: Number, required: false, min: 0, max: 5 },
                    extraCurricular: { type: Number, required: false, min: 0, max: 5 },
                    attendance: { type: Number, required: false, min: 0, max: 5 }
                },
                totalOutOf25: { 
                    type: Number,
                    required: false,
                    min: 0,
                    max: 25
                }
            }
        }
    ],
    practicals: [
        {
            name: { type: String, required: false },
            marks: { type: Number, required: false, min: 0, max: 100 }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically calculate outOf5 and totalOutOf25 before saving
resultSchema.pre("save", function(next) {
    if (this.subjects && Array.isArray(this.subjects)) {
        this.subjects.forEach(subject => {
            if (subject.marks && subject.marks.ct1) {
                // Round to nearest integer
                subject.marks.ct1.outOf5 = Math.round((subject.marks.ct1.outOf75 || 0) / 15);
            }
            if (subject.marks && subject.marks.ct2) {
                subject.marks.ct2.outOf5 = Math.round((subject.marks.ct2.outOf75 || 0) / 15);
            }
            // Calculate totalOutOf25: ct1.outOf5 + ct2.outOf5 + assignment + extraCurricular + attendance
            const ct1_5 = subject.marks?.ct1?.outOf5 || 0;
            const ct2_5 = subject.marks?.ct2?.outOf5 || 0;
            const assignment = subject.marks?.otherMarks?.assignment || 0;
            const extraCurricular = subject.marks?.otherMarks?.extraCurricular || 0;
            const attendance = subject.marks?.otherMarks?.attendance || 0;
            // Round to nearest integer
            subject.marks.totalOutOf25 = Math.round(ct1_5 + ct2_5 + assignment + extraCurricular + attendance);
        });
    }
    next();
});

module.exports = mongoose.model("Result", resultSchema);