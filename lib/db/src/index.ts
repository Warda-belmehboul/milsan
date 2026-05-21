// Export the database connection
export { db } from './db';
export type { Database } from './types';

// Export all schema tables
export * from './schema';

// Explicitly export each table that your API server expects
export { 
    dictionaryTable,
    proofreadersTable,
    sessionsTable,
    rhymesTable,
    coursesTable,
    quizQuestionsTable,
    postsTable,
    postRepliesTable,
    messagesTable,
    spellingTextsTable,
    tafseehEntriesTable,
    wordOrderingTable
} from './schema';
