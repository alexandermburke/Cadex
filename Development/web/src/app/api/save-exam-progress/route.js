// /app/api/save-exam-progress/route.js
import { NextResponse } from 'next/server';

let progresses = []; // In-memory storage (replace with a database in production)

export async function POST(request) {
  try {
    const progressData = await request.json();
    const id = Date.now().toString(); // Generate a simple ID
    progresses.push({ id, ...progressData });
    return NextResponse.json({ message: 'Progress saved successfully', id }, { status: 200 });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
