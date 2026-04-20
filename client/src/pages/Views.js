import { Link } from "react-router-dom";
import "./Views.css"
import pell from "../assets/fonts/pexels-ballet-1840427_1920.jpg"

const Views = ( ) => {

    return(
        <div className="views-container">
            
            <div className="top">
                <div className="imgg-top">
                    <img src="https://images.unsplash.com/photo-1568849676085-51415703900f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="first-image" className="first"/>
                    <img src="https://images.unsplash.com/photo-1481841580057-e2b9927a05c6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNvdXBsZXxlbnwwfHwwfHx8MA%3D%3D" alt=""className="mid"></img>
                    <img src="https://images.unsplash.com/photo-1615574147326-99d907ca408c?q=80&w=777&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt=""className="end"></img>
                </div>
                <h1 className="top-header"> FOR THE LOVERS AND THE FEELERS </h1>
            </div>
            <section>
                <div className="left">
                    <div className="left-details">

                  
                    <p>
                         <b>You know that feeling when you’re scrolling through your camera roll at 2am, stumbling on photos from a trip, a birthday, a random Tuesday that somehow became unforgettable?
 </b><br/>
 Those moments deserve more than sitting in a folder nobody looks at. <br/>
<b>Echoes</b> gives you and your people a private shared space to upload photos, drop memories and stay connected — no matter where life takes you.<br/>
<b>Create a scrapbook</b>, invite your partner, your family or your closest friends and start building something beautiful together.<br/> Every time someone adds a memory everyone gets notified instantly. No more missing moments.
<br/> <b>And when your scrapbook is full of life? Print it.</b> We turn your digital memories into a real hardcover book — Polaroid-style pages, a personal dedication note and your cover — shipped straight to your door anywhere in the world.
No ads. No strangers. No algorithm. Just you and the people you love.
So take those pictures, upload those memories and let Echoes keep you and your loved ones connected. 🌸
</p>
                    
                    <span className="logs"> <span className="register"><Link to="/auth">Get Started</Link></span>   </span>
                      </div>
                     
                </div>
                <div className="right">
                    <img src="https://images.unsplash.com/photo-1755976264282-dea1f8dd443d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="sec-img"></img>
                </div>
            </section>
            <article>
                <div className="article-left">
                    <div className="article-img">
                        <img className="bee" src={pell} alt="" />
                     <div className="messy">

                        <span><img src="/images/pyjamas.png" alt="" className="icons"/></span>
                      <h1>
                        WHAT IF THOSE DAILY MESSY <br/> UNEXCITING MOMENTS<br/> WERE WHAT  REMIND
                        YOU<br/> OF YOUR WORTH?
                     </h1>
                       </div>
            
                    </div>
                    </div>
    <div className="article-bottom">

  <div className="art-p">
    
                    <p className="article-p"> 
 Memories are love letters we write to our future selves. They are the soft proof that we lived, that we felt deeply, that ordinary days once shimmered in golden light. A shared laugh, a quiet sunset, a random photo taken at the wrong angle — these are the little treasures that grow sweeter with time. Some moments don’t ask to be remembered — they just quietly become unforgettable. The way someone looked at you when you weren’t paying attention. The laughter that echoed a little too long. The soft stillness of a day that felt ordinary but somehow perfect. 
Echoes is a private shared scrapbook built for couples, families and friends who want to capture life’s best moments together. Upload memories, stay connected in real time, print your scrapbook as a beautiful hardcover book and have it delivered to your door
 no matter where life takes you  
🌸 <br/>
</p>
                    
                    
                    </div>

            <div className="art-img">

                        <img className="cee" src="https://images.unsplash.com/photo-1603234924544-526ab57f77d9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
                    
            
                    
                 
           </div>
              
            </article>
            <footer>
                <div className="foot-deets">

               
                <img src="https://images.unsplash.com/photo-1755810114356-8bc11c67c409?q=80&w=1440&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" className="foot-img"></img> 
                <h2 className="footer-h">PERFECTLY IMPERFECT MEMORIES  <br></br>ARE THE ART OUR EXPERIENCES<br></br> LEAVE BEHIND</h2>
                  <img src="https://images.unsplash.com/photo-1584018344977-1785e2aab7fe?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="" className="foot-img-b"></img> 
                   </div>
            </footer>
           <div className="copyright">
    <p>© 2026 Echoes. Built by Temitayo. All rights reserved.</p>
</div>
        </div>
    )
}

export default Views;