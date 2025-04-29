import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'delivery') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    await connectToDatabase();
    
    const pendingOrders = await Order.find({ status: 'pending' })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      orders: pendingOrders 
    });
  } catch (error) {
    console.error('Get pending orders error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}