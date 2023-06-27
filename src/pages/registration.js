import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer";
import { showToast } from "@/toastHelper";
import jwt from 'jsonwebtoken';
import {BASE_API_URL} from '@/config';
import React, { useEffect, useState } from 'react';
import {useRouter} from "next/router";

export default function Registration() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleGoogleAuth = (event) => {
            const url = `${BASE_API_URL}/auth/google`;
            const width = 800;
            const height = 600;
            const options = `width=${width},height=${height},resizable,scrollbars=yes,status=1`;
            window.open(url, '_blank', options);
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
                    response.text().then((text) => {
                        showToast('Registracija uspešna!<br>' + text);
                    });
                } else {
                    showToast('Registracija neuspešna!', 'error');
                }
            })
            .catch((error) => {
                showToast('Error:' + error, 'error');
            });
    };

    const handleLogout = (event) => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("login_token");
            showToast('Uspešna odjava!<br>Prebacićemo vas na početnu stranicu');
            setTimeout(function (){
                window.location.href = '/';
            },3000)

        } catch (error) {
            showToast('Error u odjavi:' + error.message, 'error');
            return null;
        }
    };

     const decodeJwtToken = (token) => {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        } catch (error) {
            showToast('Error decoding JWT token:' + error.message, 'error');
            return null;
        }
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
                    response.json().then((json) => {
                        const {token} = json; // Access the 'token' property from the JSON response
                        const decodedToken = decodeJwtToken(token);
                        console.log(decodedToken)
                        localStorage.setItem('login_token', token); // Save the token to localStorage with the key 'login_token'
                        localStorage.setItem('user', JSON.stringify(decodedToken)); // Save the token to localStorage with the key 'login_token'
                        showToast('Login uspešan!<br>Prebacićemo vas na početnu stranicu');
                        setTimeout(function (){
                            window.location.href = '/';
                        },3000)
                    });
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
            {!user ? (<>
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
                        <div className="flex items-center sm:justify-between justify-center flex-wrap">
                            <button
                                className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 px-4 my-2 rounded focus:outline-none focus:shadow-outline"
                                type="submit">
                                Prijavi se
                            </button>
                            {/* Google auth login button */}
                            <div className="px-6 sm:px-0 max-w-sm">
                                <button type="button" onClick={handleGoogleAuth}
                                        className="text-white w-full  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between dark:focus:ring-[#4285F4]/55">
                                    <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false"
                                         data-prefix="fab" data-icon="google" role="img"
                                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor"
                                              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Prijavi se sa Google
                                    <div></div>
                                </button>
                            </div>
                            <a className="inline-block pt-5 align-baseline font-bold text-md text-green-600 hover:text-green-400"
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
            </div></>
                ) : (
                <><div>
                    <p className='text-2xl my-5 text-center font-bold'>Odjava</p>
                                <div className="flex items-center justify-center">
                                    <button
                                        className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 my-6 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button" onClick={handleLogout}>
                                        Izloguj se
                                    </button>
                                </div>
                    </div></>
                )}

            <Footer/>
        </>

    )
}
