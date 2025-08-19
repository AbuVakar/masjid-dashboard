import React from 'react';

const VisionMission = () => {
  return (
    <section className='vm-section' aria-labelledby='vm_heading'>
      <div className='vm-hero'>
        <div className='vm-hero-title'>Our Vision & Mission</div>
        <div className='vm-hero-sub'>Masjid: Ilm • Ibadat • Ittihad</div>
      </div>

      <div className='vm-grid'>
        <article className='vm-card vision-card'>
          <span className='vm-badge'>🌟 Vision (Manzil)</span>
          <p className='vm-lead'>
            Har ghar, har fard ka ta’alluq <strong>masjid</strong> se mazboot ho
            — taaki <strong>imaan</strong>,<strong> akhlaaq</strong> aur{' '}
            <strong>ummati ittihad</strong> qayam rahe.
          </p>
          <div className='vm-quote-block'>
            "Jo masjid se mohabbat rakhta hai, Allah us se mohabbat rakhta hai."
            — Ibn Majah 802
          </div>
          <div className='vm-quote-block'>
            "Tum behtareen ummat ho… neki ka hukm, burai se mana, aur Allah par
            imaan." — Surah Aal-e-Imran 3:110
          </div>
        </article>

        <article className='vm-card mission-card'>
          <span className='vm-badge'>🎯 Mission (Koshish)</span>
          <p className='vm-lead'>
            Masjid ke zariye har fard ko <strong>ibadat</strong>,{' '}
            <strong>ilm</strong> aur <strong>tableeg</strong> se actively jorna.
          </p>
          <ul className='vm-pill-list'>
            <li>
              <span className='vm-pill'>Prayer Connection</span>
              <span className='vm-pill-note'>
                “Namaz ko qayam karo.” — Al-Baqarah 2:43
              </span>
            </li>
            <li>
              <span className='vm-pill'>Jamaat Updates</span>
              <span className='vm-pill-note'>
                “Momin sirf bhai hain.” — Al-Hujurat 49:10
              </span>
            </li>
            <li>
              <span className='vm-pill'>Knowledge Sharing</span>
              <span className='vm-pill-note'>
                “Meri taraf se pahuncha do…” — Bukhari 3461
              </span>
            </li>
            <li>
              <span className='vm-pill'>Community Engagement</span>
              <span className='vm-pill-note'>
                “Momin imaarat ki tarah hai.” — Bukhari 2446
              </span>
            </li>
            <li>
              <span className='vm-pill'>Privacy & Respect</span>
              <span className='vm-pill-note'>
                “Bhai ki izzat ki hifazat karo…” — Tirmidhi 1931
              </span>
            </li>
          </ul>
        </article>
      </div>

      <div
        className='vm-tags'
        style={{
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span className='vm-tag'>🏷 Masjid: Ibadat, Ilm, Ittihad</span>
        <div className='vm-caption'>
          (Hadees: “Meri taraf se pahuncha do, agarche ek ayat hi kyun na ho.” –
          Sahih Bukhari 3461)
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
