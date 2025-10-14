import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">KwikCut</h1>
            <nav>
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/" className="hover:underline">Home</Link>
                    </li>
                    <li>
                        <Link to="/about" className="hover:underline">About</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;