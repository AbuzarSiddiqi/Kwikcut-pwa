import React from 'react';

const About: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">About KwikCut</h1>
            <p className="mt-4 text-lg text-center">
                KwikCut is a Progressive Web App designed to streamline your cutting tasks with efficiency and ease.
                Our goal is to provide users with a seamless experience, whether on desktop or mobile.
            </p>
        </div>
    );
};

export default About;