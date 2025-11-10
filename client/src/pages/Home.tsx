import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Planning & Scheduling App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your appointments and schedule efficiently
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/book-appointment">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book Appointment
              </Button>
            </Link>
            <Link href="/appointments">
              <Button size="lg" variant="outline">
                View My Appointments
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book appointments quickly and easily with our intuitive interface
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications about your appointments and schedule changes
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Admin Dashboard</h3>
            <p className="text-gray-600">
              Comprehensive dashboard for managing all appointments and users
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
