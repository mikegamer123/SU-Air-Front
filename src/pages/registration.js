import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import { showToast } from "@/toastHelper";
import {BASE_API_URL} from '@/config';
import React, { useEffect, useState } from 'react';

export default function Registration() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmitRegister = (event) => {
        event.preventDefault();
        const data = {
            name: name,
            email: email,
            password: password
        };

        fetch(`${BASE_API_URL}/rauth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    showToast('Registracija uspešna!');
                    // Perform further actions after successful registration
                } else {
                    showToast('Registrcija neuspešna!', 'error');
                    // Handle registration failure
                }
            })
            .catch((error) => {
                showToast('Error:' + error, 'error');
                // Handle network error
            });
    };

    const handleSubmitLogin = (event) => {
        event.preventDefault();
        const data = {
            email: email,
            password: password
        };

        fetch(`${BASE_API_URL}/rauth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok) {
                    showToast('Login uspešan!');
                    // Perform further actions after successful login
                } else {
                    showToast('Login netačan!', 'error');
                    // Handle login failure
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle network error
            });
    };




    return (
        <>
            <Navbar/>
            <p className='text-2xl mt-5 text-center font-bold'>PRIJAVA</p>
            <div className='flex justify-center'>
                <div className="w-full max-w-lg mt-4">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmitLogin}>
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email" value={email} onChange={handleEmailChange}  name='email' type="email" placeholder="Email" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password" value={password} onChange={handlePasswordChange}  type="password"  placeholder="******************" />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit">
                                Prijavi se
                            </button>
                            <a className="inline-block align-baseline font-bold text-sm text-green-600 hover:text-green-400"
                               href="#">
                                Zaboravili ste lozinku?
                            </a>
                        </div>
                    </form>
                </div>
            </div>


            <hr className='my-4'/>
            <p className='text-2xl text-center text-gray-400'>ILI</p>
            <hr className='my-4'/>

            <p className='text-2xl mt-5 text-center font-bold'>REGISTRACIJA</p>
            <div className='flex justify-center'>
                <div className="w-full max-w-lg mt-4">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmitRegister}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Puno Ime
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name" value={name} onChange={handleNameChange} name='name' type="text" placeholder="Ime" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email" value={email} onChange={handleEmailChange} name='email' type="email" placeholder="Email" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                name='password' value={password} onChange={handlePasswordChange} id="password" type="password" placeholder="******************" />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit">
                                Registruj se
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer/>
        </>

    )
}
