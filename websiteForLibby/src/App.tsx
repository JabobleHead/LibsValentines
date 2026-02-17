//import { useState } from 'react'
//import './App.css'
import Header from "./components/Header"
import SecretNote from "./components/SercretNote"
import DateIdeas from "./components/DateIdeas"
import PhotoSlideshow from './components/FavoritePic';
import Spotify from "./components/SongsThatMakeMeThinkOfYou"
import ThingsILove from './components/ThingsILoveAboutYou';
import EgyptianRatScrew from './components/EgyptianRatScrew/EqyptianRatScrew';



const photos = [
  {
    src: '/Photos/DodgeParkWalk.jpeg',
    caption: 'I remember we had plans to hang out all afternoon, but I had to work the lunch shift. Instead, we still got to go on a walk around Dodge Park. I loved how you were willing to adapt and were understanding about the situation. I loved making the most of it.'
  },
  {
    src: '/Photos/FirstTimeIGotYouFlowers.jpeg',
    caption: 'I remember comming home from school and just thinking I had to do something to surprise you, even though it was just something small.'
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
      <EgyptianRatScrew/>
    </div>
      
    </>
  )
}

export default App
