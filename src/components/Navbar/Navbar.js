import Head from 'next/head';
import Link from 'next/link';
import LogoImg from 'src/resources/images/logo.png'
import LogoWhiteImg from 'src/resources/images/logo-white.png'
import RegistrationImg from 'src/resources/images/reg-icon.png'
import SearchImg from 'src/resources/images/ic-search-black.svg.png'
import styles from './Navbar.module.css'
import {useRouter} from 'next/router'
import {useEffect, useState} from 'react';


export default function Navbar({hide = false}) {

    const [navbar, setNavbar] = useState(false);
    const [user, setUser] = useState(null);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const router = useRouter();

    const routeList = [
        { label: 'Početna', route: '/' },
        { label: 'Widget-i', route: '/widgets' },
        { label: 'Istorija', route: '/history' },
        { label: 'Politika o privatnosti', route: '/politika-o-privatnosti' },
        { label: 'Uslovi korišćenja', route: '/uslovi-koriscenja' },
        { label: 'Korisnik-Registracija', route: '/registration' },
        { label: 'Heat-Map', route: '/heat-map' },
        { label: 'Lokacije', route: '/heat-map' },
        { label: 'Kvalitet Vazduha', route: '/heat-map' },
    ];

    const handleSearchChange = (event) => {
        let searchTerm = event.target.value;
        const filteredLocalRoutes = routeList.filter(route =>
            searchTerm !== "" && route.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRoutes(filteredLocalRoutes);
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    function hideLoader() {
        // Get the .loading element
        const loading = document.querySelector('.loading');
        loading.style.display = 'none';
    }

    return (<div>

        <div className={styles.toast} id="toast">
            <img id='toastPic' className={styles.toastPic}></img>
            <p id='toastText' className="text px-8">Some Information</p>
            <button id="close-button" className={styles.closeButton}>
                &#10005;
            </button>
        </div>

        <div className='loading' onAnimationEnd={hideLoader}>
            <div className='loading-img-cont'><img className='loading-img' src={LogoWhiteImg.src} alt="loading-Logo"/>
            </div>
        </div>
        <Head>
            <title>SU AIR</title>
            <meta
                name="description"
                content="SU AIR APP"
            />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
                  integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI="
                  crossOrigin=""/>
            {/* Make sure you put this AFTER Leaflet's CSS */}
            <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
                    integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM="
                    crossOrigin=""></script>
            <link rel="icon" href="/public/favicon.ico"/>
        </Head>
        <nav className={"w-full bg-white shadow " + (hide ? "hidden" : "")}>
            <div className="justify-between px-4 mx-auto lg:max-w-screen-2xl lg:items-center lg:flex lg:px-8">
                <div>
                    <div className="flex items-center justify-between py-3 lg:py-5 lg:block">
                        <Link href="/">
                            <h2 className="text-2xl text-white font-bold hoverButton"><img src={LogoImg.src} alt='LOGO'></img>
                            </h2>
                        </Link>
                        <div className="lg:hidden">
                            <button
                                className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                                onClick={() => setNavbar(!navbar)}
                            >
                                {navbar ? (<svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6 text-black"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>) : (<svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>)}
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    className={`flex-1 justify-self-center pb-3 mt-8 lg:block lg:pb-0 lg:mt-0 ${navbar ? 'block' : 'hidden'} ${styles.nav}`}
                >
                    <ul className="items-center justify-end py-3 space-y-8 lg:flex lg:space-x-6 lg:space-y-0">
                        <li className={'text-black ' + styles.hoveredListItem}>
                            <Link href="/">
                                        <span className={/^\/$/.test(router.route) ? styles.currentPage : ''}>
                                        Početna
                                            </span>
                            </Link>
                        </li>
                        <li className={'text-black ' + styles.hoveredListItem}>
                            <Link href="/heat-map/">
                                         <span className={router.route.includes('/heat-map') ? styles.currentPage : ''}>
                                        Heat map
                                        </span>
                            </Link>
                        </li>
                        <li className={'text-black ' + styles.hoveredListItem}>
                            <Link href="/history">
                                        <span className={router.route.includes('/history') ? styles.currentPage : ''}>
                                        Istorija
                                            </span>
                            </Link>
                        </li>
                        <li className={'text-black ' + styles.hoveredListItem}>
                            <Link href="/widgets">
                                         <span className={router.route.includes('/widgets') ? styles.currentPage : ''}>
                                        Widget-i
                                            </span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div
                    className={`flex-1 justify-self-center pb-3 mt-8 lg:block lg:pb-0 lg:mt-0 ${navbar ? 'block' : 'hidden'} ${styles.nav}`}
                >
                    <ul className="items-center justify-end py-3 space-y-8 lg:flex lg:space-x-6 lg:space-y-0">
                        <li className={'text-black'}>
                            <div className={"flex " + styles.searchBar}>
                                <img className={styles.searchIcon} src={SearchImg.src} alt='Search Icon'></img>
                                <input className={"w-full " + styles.searchInput} type='text'
                                       placeholder='Pretraga' onChange={handleSearchChange}></input>
                            </div>
                            {filteredRoutes.length > 0 && (<div className={styles.foundRoutesDiv}>
                                <ul>
                                    {filteredRoutes.map((route, index) => (
                                        <Link href={route.route} key={index}>
                                            <li>{route.label}</li>
                                        </Link>
                                    ))}
                                </ul>
                            </div>)}
                        </li>
                        <li className={'text-black ' + styles.hoveredListItem}>
                            <Link href="/registration">
                                <div className='py-3'>
                                    <img className={styles.registrationIcon} src={RegistrationImg.src}
                                         alt="Registration Icon"/>
                                    <span className={router.route === '/registration' ? styles.currentPage : ''}>
                                           { user ? user.name : "Registracija" }
                                            </span>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>);
}