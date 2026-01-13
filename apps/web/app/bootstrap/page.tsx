'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BootstrapPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        teamName: '',
        teamIndustry: ''
    });

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleComplete = async () => {
        try {
            // TODO: Call API to create master admin and first team
            console.log('Bootstrap data:', formData);
            router.push('/admin');
        } catch (error) {
            console.error('Bootstrap failed:', error);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#4B9DA9] via-[#91C6BC] to-[#F6F3C2] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold
                  ${s <= step ? 'bg-white text-[#4B9DA9]' : 'bg-white/30 text-white'}
                  transition-all duration-300
                `}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">🚀</div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Welcome to Your ATS Platform
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Let's get you set up in just a few steps. This wizard will help you create your master admin account and your first team.
                            </p>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                Get Started →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Admin Account */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Admin Account</h2>
                            <p className="text-gray-600 mb-6">This will be your master administrator account.</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.adminFirstName}
                                            onChange={(e) => updateFormData('adminFirstName', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.adminLastName}
                                            onChange={(e) => updateFormData('adminLastName', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={(e) => updateFormData('adminEmail', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                        placeholder="admin@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={(e) => updateFormData('adminPassword', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: First Team */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Team</h2>
                            <p className="text-gray-600 mb-6">Set up your organization's team.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                                    <input
                                        type="text"
                                        value={formData.teamName}
                                        onChange={(e) => updateFormData('teamName', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                        placeholder="Tech Recruiters Inc"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                                    <select
                                        value={formData.teamIndustry}
                                        onChange={(e) => updateFormData('teamIndustry', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                                    >
                                        <option value="">Select industry...</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === 4 && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Set!</h2>
                            <p className="text-gray-600 mb-8">
                                Your platform is ready to go. Click below to access your admin dashboard.
                            </p>
                            <button
                                onClick={handleComplete}
                                className="px-8 py-3 bg-gradient-to-r from-[#E37434] to-[#F6F3C2] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {step > 1 && step < 4 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
