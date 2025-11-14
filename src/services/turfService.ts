// turfService.ts
import mongoose from 'mongoose';
import { StoryModel } from '../models/storyModel';

type TurfEntry = { main: string | null; en: string | null; count: number };

/**
 * Get the user's turf(s): most frequent suburb(s) across their stories.
 * Returns [] if no stories with suburb.
 */
const getTurfOfUser = async (userId: string): Promise<TurfEntry[]> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];

    const authorId = new mongoose.Types.ObjectId(userId);

    const result = await StoryModel.aggregate([
        // Filter left the selected user's posts
        { $match: { author: authorId } },

        // Pull, trim, and nullify empty strings for suburb names

        // Map the result to list with new item structure
        // Take out unwanted fields (_id)
        // Add field: mainRaw and enRaw
        {
            $project: {
                _id: 0,
                mainRaw: '$venue.suburb.main',
                enRaw: '$venue.suburb.en',
            },
        },

        // Turn " ", "" to null
        {
            $addFields: {
                main: {
                    $let: {
                        vars: { s: { $ifNull: ['$mainRaw', ''] } },
                        in: {
                            $cond: [
                                { $gt: [{ $strLenCP: { $trim: { input: '$$s' } } }, 0] },
                                { $trim: { input: '$$s' } },
                                null,
                            ],
                        },
                    },
                },
                en: {
                    $let: {
                        vars: { s: { $ifNull: ['$enRaw', ''] } },
                        in: {
                            $cond: [
                                { $gt: [{ $strLenCP: { $trim: { input: '$$s' } } }, 0] },
                                { $trim: { input: '$$s' } },
                                null,
                            ],
                        },
                    },
                },
            },
        },

        // Canonical key: prefer Chinese `main`; else lowercase English
        {
            $addFields: {
                enNorm: { $cond: [{ $ne: ['$en', null] }, { $toLower: '$en' }, null] },
                canonical: { $cond: [{ $ne: ['$main', null] }, '$main', '$enNorm'] },
            },
        },
        { $match: { canonical: { $ne: null } } },

        // Count by canonical key; keep representative names
        {
            $group: {
                _id: '$canonical',
                count: { $sum: 1 },
                main: { $first: '$main' },
                en: { $first: '$en' },
            },
        },
        { $sort: { count: -1 } },

        // Pick max count and return all ties
        {
            $group: {
                _id: null,
                maxCount: { $first: '$count' },
                items: { $push: { main: '$main', en: '$en', count: '$count' } },
            },
        },
        {
            $project: {
                _id: 0,
                items: {
                    $filter: {
                        input: '$items',
                        as: 'it',
                        cond: { $eq: ['$$it.count', '$maxCount'] },
                    },
                },
            },
        },
        { $unwind: '$items' },
        { $replaceWith: '$items' },
    ]);

    return result as TurfEntry[];
};

export { getTurfOfUser, TurfEntry };
