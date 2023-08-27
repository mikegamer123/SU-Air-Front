import React, {useEffect, useState} from 'react';
import styles from './CodeCopier.module.css';
import {BASE_API_URL} from "@/config";
import {showToast} from "@/toastHelper";

const CodeCopier = ({user, widgetType}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [localUrl, setLocalUrl] = useState('');
    const [userWebSites, setUserWebSites] = useState(null);
    const [webSite, setWebsite] = useState(null);

    const getUserWebsites = () => {
        //get user websites
        fetch(BASE_API_URL + '/website/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('login_token')
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserWebSites(data);
            });
    }

    const handleChange = (event) => {
        const {name, value} = event.target;
        setWebsite(value);
        showToast("Promenili ste web sajt za widget! <br>Možete kopirati novi kod za widget na vaš sajt!", "info")
    };

    useEffect(() => {
        setLocalUrl(window.location.href);
        getUserWebsites();
    }, []);

    useEffect(() => {
        setWebsite(userWebSites ? userWebSites[0] : null);
    }, [userWebSites]);

    const iframeCode = '<iframe class="suAir-frame" src="' + localUrl + '/' + widgetType + '?apiKey=' + (user ? user.id : "") + "_" + (userWebSites ? webSite : "") + '" width="600" height="'+ (widgetType && widgetType === "weather" ? "480px" : "400px") +'"></iframe> <script>const iframeElements = document.getElementsByClassName(\'suAir-frame\');for (const iframe of iframeElements) {const currentSrc = iframe.getAttribute(\'src\');const newSrc = `${currentSrc}&referrer=${encodeURIComponent(window.location.href)}`;iframe.setAttribute(\'src\', newSrc);}</script>';
    const handleCopy = () => {
        navigator.clipboard.writeText(iframeCode).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 1500);
        });
    };

    return (
        <div className={styles.codeContainer + " codeCopier"}>
            <div className="filterSingle">
                <label>Web sajt:</label>
                <div className="select"> <select name="name" value={webSite} onChange={handleChange}>
                    {userWebSites && userWebSites.length > 0 ? userWebSites.map((userWebSite, index) => (
                        <option key={index} value={userWebSite}>
                            {userWebSite}
                        </option>
                    )) : (<option value="none">Trenutno nema prijavljeni web sajt</option>)}
                </select></div>
            </div>
            <pre><code>{iframeCode}</code></pre>
            <button disabled={!user} onClick={handleCopy}
                    className={styles.copyButton + " " + (user && userWebSites && userWebSites.length > 0 ? "" : styles.disabledButton)}>
                {user ? (!(userWebSites && userWebSites.length > 0) ? 'Nemate prijavljeni web sajt, prijavite web sajt na korisničkoj stranici' : (isCopied ? 'Kopirano!' : 'Kopirajte kod za widget')) : 'Napravite nalog kako bi preuzeli widget'}
            </button>
        </div>
    );
};

export default CodeCopier;