import Navbar from "src/components/Navbar/Navbar"
import Footer from "src/components/Footer/Footer"
import Function1 from "src/resources/images/ss1.png"
import Function2 from "src/resources/images/ss3.png"
import Function4 from "src/resources/images/ss5.png"

export default function Home() {
  return (
      <>
    <Navbar/>
        <div className="mainContent px-4 mx-auto lg:max-w-screen-2xl lg:items-center lg:px-8">
          <h1>SUAIR - Kvalitet Vazduha u Subotici</h1>
          <h2 className="functions">Funkcionalnosti SUAIR:</h2>
          <section className="function-card heatmap-section">
            <h2>Mapa kvaliteta vazduha po mesnim zajednicama</h2>
            <div className="history-desc">
              <p>
                Ova interaktivna toplotna mapa prikazuje kvalitet vazduha u svakoj mesnoj zajednici u Subotici. <br/>Boje na mapi predstavljaju nivo zagađenja vazduha, omogućavajući vam brz pregled stanja širom grada.              </p>
            </div>
            <img src={Function1.src} alt="function1-img"/>
          </section>

          <section className="function-card widget-section">
            <h2>Integrisani vidžeti</h2>
            <div className="history-desc">
              <p>
                Naši vidžeti omogućavaju vam da jednostavno integrišete informacije o kvalitetu vazduha na vašu veb stranicu. Kopirajte i nalepite kod vidžeta kako biste omogućili vašim posetiocima da brzo pristupe trenutnim podacima o vazduhu.              </p>
            </div>
          </section>

          <section className="function-card historical-data-section">
            <h2>Istorijat merenja</h2>
            <div className="history-desc">
              <p>
                Istorijski podaci vam omogućavaju da pratite promene u kvalitetu vazduha tokom vremena. <br/> Izaberite da li želite da prikažete podatke po danima, satima ili mesecima i istražujte kako se kvalitet vazduha menjao tokom različitih vremenskih perioda.
              </p>
            </div>
            <img src={Function2.src} alt="function2-img"/>
          </section>

          <section className="function-card favorites-section">
            <h2>Omiljeni podaci</h2>
            <div className="history-desc">
              <p>
                Sačuvajte svoje omiljene podatke kako biste brzo pristupili informacijama koje su vam najvažnije. <br/> Dodajte trenutno prikazane podatke u listu omiljenih kako biste im lako pristupali u budućnosti.              </p>
            </div>
            <img src={Function4.src} alt="function4-img"/>
          </section>
        </div>
    <Footer/>
      </>
  )
}
