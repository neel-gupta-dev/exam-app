import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PredictorLead from '@/models/PredictorLead';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Connect to database
    await dbConnect();
    
    // Create new lead document
    const lead = new PredictorLead({
      ...data,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });
    
    await lead.save();
    
    return NextResponse.json({ success: true, id: lead._id }, { status: 201 });
  } catch (error) {
    console.error('Error storing predictor lead:', error);
    // Don't leak DB errors to client, just return a generic success false
    // so it doesn't break the frontend flow
    return NextResponse.json({ success: false, error: 'Failed to store lead' }, { status: 500 });
  }
}
