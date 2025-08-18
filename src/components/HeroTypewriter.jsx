import React, { useEffect, useState } from 'react';
import bgImage from '../assets/madina.jpg';

// Config
const typingSpeed = 100; // ms per character while typing
const pauseMs = 4000; // pause after a full quote (in ms)

const LINES = [
  {
    text: 'Aur tum mein se ek jamaat aisi honi chahiye jo bhalai ki taraf bulaye aur nek kaamo ka hukm kare aur bure kaamo se roke, aur yahi log kamiyabi paane waale hain.',
    ref: 'Surah Ali Imran 3:104',
  },
  {
    text: 'Tum behtareen Ummah ho jo logon ke liye paida ki gayi hai, tum neki ka hukm dete ho aur burai se rote ho aur Allah par iman rakhte ho.',
    ref: 'Surah Ali Imran 3:110',
  },
  {
    text: 'Apne Rab ke raaste ki taraf samajhdari aur achi nasihat ke saath bulao, aur unse is tarah bahas karo jo behtareen ho.',
    ref: 'Surah An-Nahl 16:125',
  },
  {
    text: 'Aur is se behtar baat wala kaun hai jo Allah ki taraf bulaye aur nek amal kare aur kahe ki main yaqeenan Muslims mein se hoon?',
    ref: 'Surah Fussilat 41:33',
  },
  {
    text: 'Deen mein koi zabardasti nahi hai. Yaqeenan hidayat gumrahi se alag hokar saaf ho chuki hai.',
    ref: 'Surah Al-Baqara 2:256',
  },
  {
    text: 'Meri taraf se pahuncha do, agarche ek ayat hi kyun na ho.',
    ref: 'Sahih Bukhari 3461',
  },
  {
    text: 'Aasaniyan paida karna, mushkilen nahi, khushkhabriyan sunana, nafraten paida nahi karna.',
    ref: 'ﷺSahih Bukhari 2873',
  },
  {
    text: 'Aalim ki fazilat Aabid par aisi hai jaise meri fazilat tum mein se ek aam aadmi par hai.',
    ref: 'Jami at-Tirmidhi 2685',
  },
  {
    text: 'Da’wah ka matlab hai logon ko Allah ke raaste ki taraf bulana hikmat (samajhdari) aur achhi naseehat ke saath, aur unse behas karna us tareeqe se jo sabse behtareen ho.',
    ref: 'Quran 16:125',
  },
  {
    text: 'Ma’umin log (mardon aur auraton) ek doosre ke raahnuma hain; woh nek amalaat karein, burai se rokein, namaz qayam karein, zakaat dein aur Allah o Rasool ki ita’at karein.',
    ref: 'Surah At-Tawbah 9:71',
  },
  {
    text: 'Sachche momin woh hain jo tauba karte hain, ibadat mein rehte hain, tasbeeh o sajda karte hain, mazeed nek amal karte hain, burai se bachchte hain, aur Allah ki haddain qadim par rehte hain.',
    ref: 'Surah At-Tawbah 9:112',
  },
  {
    text: 'O mere bête! Namaz qayam karo, nek baat karne ki istemal karo, bure se roko, aur sabr ke saath jiyo — ye sabse zabardast azm hai.',
    ref: 'Luqman 31:17',
  },
  {
    text: 'Momin ka bhai uska dushman nahi ho sakta; Quran mein farmaya gaya hai: ‘Ma’umin log bhai bhai hain, is liye apne bhaiyon ke darmiyan sulah karo.’',
    ref: 'Surah Al-Hujuraat 49:10',
  },
  {
    text: 'Jo kisi ko nek raah par razaamand karata hai, usko utna hi ajar milta hai jitna us par amal karne wale ko, bina unke ajar se kuch kam kiye.',
    ref: 'Sahih Muslim 2674',
  },
  {
    text: 'Jo insaan kisi bhai ki museebat door kare, Allah qiyamat ke din uski museebat door karega.',
    ref: 'Sahih Muslim (various sources)',
  },
  {
    text: "Quran farmata hai: 'Allah un logon ke saath hai jo taqwa rakhte hain aur nek amal karte hain.'",
    ref: 'Surah An-Nahl 16:128',
  },
  {
    text: "Har barai (harshness) se bachna chahiye, kyonki Prophet ﷺ ne farmaya: 'Allah naram mizaj hai aur use naram mizaj pasand hai.'",
    ref: 'Sahih Bukhari 6528',
  },
  {
    text: "Achchi taalimi mahol aur akhlaaq hi da’wah ko maqbool banate hain — Prophet ﷺ ne farmaya: 'Main akhlaaq ko mukammal karne ke liye bheja gaya hoon.'",
    ref: 'Muwatta Malik',
  },
];

const HeroTypewriter = ({ L }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Main typewriter effect
  useEffect(() => {
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const { text, ref } = LINES[quoteIndex];
      const fullText = ref ? `${text} - ${ref}` : text;

      if (isDeleting) {
        // Deleting text
        currentCharIndex--;
      } else {
        // Typing text
        currentCharIndex++;
      }

      // Update displayed text
      setDisplayText(fullText.substring(0, currentCharIndex));

      if (!isDeleting && currentCharIndex === fullText.length) {
        // Finished typing, wait then start deleting
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          isDeleting = true;
          type();
        }, pauseMs);
        return;
      } else if (isDeleting && currentCharIndex === 0) {
        // Finished deleting, move to next quote
        isDeleting = false;
        setQuoteIndex((prev) => (prev + 1) % LINES.length);
        return;
      }

      // Set typing speed
      const typingSpeedVariation = Math.random() * 20 - 10; // Add slight randomness
      const speed = isDeleting
        ? typingSpeed / 2
        : typingSpeed + typingSpeedVariation;

      // Continue typing/deleting
      timeoutId = setTimeout(type, speed);
    };

    // Start the typewriter effect
    timeoutId = setTimeout(type, typingSpeed);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [quoteIndex]);

  const { text, ref } = LINES[quoteIndex];
  const isRefShown = ref && displayText.length > text.length + 3; // +3 for " - "
  const displayMainText = isRefShown ? text : displayText;
  const displayRef = isRefShown ? displayText.substring(text.length + 3) : '';

  return (
    <section
      className="hero-tw"
      aria-label="Madina Masjid Welcome Section"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-tw-inner">
        <h1 className="hero-title">
          {L?.hero_title || 'Welcome to Madina Masjid - Badarkha'}
        </h1>
        <p className="hero-sub" aria-hidden="true">
          Silsila-ul-Ahwaal
        </p>
        <div className="tw-line" aria-live="polite" aria-atomic="true">
          {displayMainText}
          {isRefShown && <span className="ref-text"> - {displayRef}</span>}
          <span
            className={`cursor ${showCursor ? 'visible' : ''}`}
            aria-hidden="true"
          >
            |
          </span>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroTypewriter);
