import {useRouter} from 'next/router';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import DynamicMap from "@/components/Map/DynamicMap";

export default function Page() {
    const router = useRouter();
    let slug = router.query.slug;
    return (
        <>
            <Navbar/>
            <div className='centerSlugDiv'>
            <DynamicMap/>
            </div>
            <Footer/>
        </>
    );
}