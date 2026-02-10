//import { useState } from 'react'
//import './App.css'
import Header from "./components/Header"
import SecretNote from "./components/SercretNote"
import DateIdeas from "./components/DateIdeas"
import PhotoSlideshow from './components/FavoritePic';

const photos = [
  {
    src: '/Photos/DodgeParkWalk.jpeg',
    caption: 'The day we first met 💕 I rember we had a diffent aaaaaaaaadsadsadasdsadsadsadasdsadasdsadasdasdsaasdsadasdsa'
  },
  {
    src: '/Photos/FirstTimeIGotYouFlowers.jpeg',
    caption: 'The first time I got you flowers'
  }
];

function App() {

  return (
    <>
    <div>
      <Header/>
      <DateIdeas/>
      <PhotoSlideshow photos={photos} autoPlayInterval={4000} />
      <SecretNote/>

    </div>
      
    </>
  )
}

export default App
