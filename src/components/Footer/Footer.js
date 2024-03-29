import ArrowImg from 'src/resources/images/arrow.png';
import Facebook from 'src/resources/images/facebook-footer.png'
import LogoImg from 'src/resources/images/logo.png'
import Instagram from 'src/resources/images/instagram-footer.png'
import Youtube from 'src/resources/images/youtube-footer.png'
import Twitter from 'src/resources/images/twitter-footer.png'
import styles from './Footer.module.css';
import Link from "next/link";
import {useState} from "react";
import {BASE_API_URL} from "@/config";
import {showToast} from "@/toastHelper";

export default function Footer() {

    const [copyright, setCopyright] = useState(new Date().getFullYear());
    const [email, setEmail] = useState('');

    const handleNewsletterSend = () => {
        const apiUrl = BASE_API_URL + '/newsletter/add-email';
        const requestData = {
            email: email
        };
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                showToast("Uspešno sačuvan mejl za newsletter!<br>Hvala na prijavi!")
            })
            .catch(error => {
                console.error('API error:', error);
                showToast("Greška u čuvanju mejla za newsletter.", "error")
            });
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    return (<>
        <div className={'grid grid-cols-1 ' + styles.footerImgDiv}>
            <div className={styles.footerNewsletter}>
                <h2 className={styles.footerNewsletterH2}>Povežite se sa SUAIRom</h2>
                <h3 className={styles.footerNewsletterH3}>Prijavite se na naše novosti</h3>
                <div className={styles.footerEmail}>
                    <input className={styles.footerEmailInput} placeholder="Email" type="email"
                           value={email}
                           onChange={handleEmailChange}/>
                    <img className={styles.footerEmailInputImg + " hoverButton"} onClick={handleNewsletterSend} src={ArrowImg.src} alt="arrow"/>
                </div>
            </div>
        </div>
        <div className='px-4 mt-8 mx-auto lg:max-w-screen-2xl md:items-center md:px-8'>
            <div className='grid grid-cols-1'>
                <div className='flex sm:flex-row sm:justify-between flex-col items-center'>
                    <div className='flex items-center hoverButton'>
                        <Link href='/'>
                        <img src={LogoImg.src} alt="logo"/>
                        </Link>
                    </div>
                    <div>
                        <ul className='items-center justify-end py-3 space-y-8 flex space-x-6 space-y-0'>
                            <li className="ml-6 mt-8 hoverButton"><a href=''> <img src={Facebook.src} alt="logo"/></a></li>
                            <li className="hoverButton"><a href=''> <img src={Twitter.src} alt="logo"/></a></li>
                            <li className="hoverButton"><a href=''> <img src={Youtube.src} alt="logo"/></a></li>
                            <li className="hoverButton"><a href=''> <img src={Instagram.src} alt="logo"/></a></li>
                        </ul>
                    </div>
                </div>
                <hr className='mt-5'/>
                <div className={'grid sm:grid-cols-6 grid-cols-3 mt-5 mb-5 ' + styles.footerEnd}>
                    <div className="sm:block hidden"></div>
                    <div className="sm:block hidden"></div>
                    <div className="sm:block hidden"></div>
                    <Link href='/uslovi-koriscenja'><div className={styles.hoveredListItem}>Uslovi korišćenja</div></Link>
                    <Link href='/politika-o-privatnosti'><div className={styles.footerEndDifferent + " " + styles.hoveredListItem}>Pravila o privatnosti</div></Link>
                    <div>© {copyright} SuAir. Sva prava reservisana</div>
                </div>
            </div>
        </div>
    </>)
}