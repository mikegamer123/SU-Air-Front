import WarningImg from 'src/resources/images/warning.webp'
import ErrorImg from 'src/resources/images/error.png'
import CheckImg from 'src/resources/images/checkMark.webp'
import InfoImg from 'src/resources/images/infoIcon.png'
export function showToast(stringToShow, typeOfToast = 'success'){

    const toast = document.getElementById('toast');
    const toastText = toast.querySelector('#toastText');
    const toastPic = toast.querySelector('#toastPic');
    toastText.innerHTML = stringToShow;
    toast.classList.add("toast-active");
    setTimeout(function() {
        toast.classList.remove('toast-active');
    }, 5000);
    document.getElementById("close-button").addEventListener("click", function () {
        toast.classList.remove("toast-active");
    })
    switch (typeOfToast){
        case "success": toastPic.src = CheckImg.src; break;
        case "error": toastPic.src = ErrorImg.src; break;
        case "warning": toastPic.src = WarningImg.src; break;
        case "info": toastPic.src = InfoImg.src; break;
        default : toastPic.src = CheckImg.src; break;
    }
}