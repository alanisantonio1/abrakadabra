
// This file has been removed as the app now uses Google Sheets exclusively
// All Supabase functionality has been replaced with Google Sheets integration

console.log('⚠️ Supabase integration has been removed. The app now uses Google Sheets exclusively.');

export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: { message: 'Supabase integration removed' } }),
    insert: () => ({ data: [], error: { message: 'Supabase integration removed' } }),
    update: () => ({ data: [], error: { message: 'Supabase integration removed' } }),
    delete: () => ({ data: [], error: { message: 'Supabase integration removed' } })
  })
};
