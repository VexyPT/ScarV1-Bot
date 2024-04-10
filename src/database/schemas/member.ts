import { Schema } from "mongoose";
import { t } from "../utils.js";

export const transactionSchema = new Schema({
    to: t.string,
    from: t.string,
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    received: { type: Boolean, default: true },
    type: { type: String, default: "??" }
});

export const memberSchema = new Schema(
    {
        id: t.string,
        coins: { type: Number, default: 0 },
        transactions: [transactionSchema],
        isBanned: { type: Boolean, default: false },
        banReason: { type: String, default: "Não definido" },
        banDate: { type: Date, default: Date.now() },

    },
    {
        statics: {
            async get(member: { id: string }) {
                const query = { id: member.id };
                return await this.findOne(query) ?? this.create(query);
            }
        }
    },
);