'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaMicrosoft, FaFacebook } from 'react-icons/fa';

interface SocialLoginButtonsProps {
    callbackUrl?: string;
}

export default function SocialLoginButtons({ callbackUrl = '/' }: SocialLoginButtonsProps) {
    const handleSocialLogin = async (provider: string) => {
        try {
            await signIn(provider, { callbackUrl });
        } catch (error) {
            console.error(`${provider} login error:`, error);
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <FcGoogle className="h-5 w-5" />
                    Google
                </button>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <FaGithub className="h-5 w-5" />
                    GitHub
                </button>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('microsoft')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <FaMicrosoft className="h-5 w-5 text-blue-600" />
                    Microsoft
                </button>

                <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    <FaFacebook className="h-5 w-5 text-blue-600" />
                    Facebook
                </button>
            </div>
        </div>
    );
}
