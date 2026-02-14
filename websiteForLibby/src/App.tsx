//import { useState } from 'react'
//import './App.css'
import Header from "./components/Header"
import SecretNote from "./components/SercretNote"
import DateIdeas from "./components/DateIdeas"
import PhotoSlideshow from './components/FavoritePic';
import Spotify from "./components/SongsThatMakeMeThinkOfYou"
import ThingsILove from './components/ThingsILoveAboutYou';


const photos = [
  {
    src: '/Photos/DodgeParkWalk.jpeg',
    caption: 'I remember we had plans to hang out all afternoon but I had to work the lunch shift. Instead we still got to go on a walk around dodge park. I loved how you were willing to adapt and were understanding about the situation. I loved making the most of it'
  },
  {
    src: '/Photos/FirstTimeIGotYouFlowers.jpeg',
    caption: 'I remember comming home from school and just thinking I had to something to surprise you'
  }
];

function App() {

  return (
    <>
    <div>
      <Header/>
      <DateIdeas/>
      <SecretNote/>
      <PhotoSlideshow photos={photos} autoPlayInterval={16000} />
      <Spotify/>
      <ThingsILove/>

    </div>
      
    </>
  )
}

export default App
