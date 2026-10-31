<template>
  <SectionedContent :sections="sections" @back="$emit('back')">
    <section id="profile" class="sectioned-content__section" aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>
      <div class="profile__panel">
        <img class="profile__img" width="500" height="500" src="../assets/pictures/headshot-square.jpg" alt="headshot" />
        <p>
            I am a PhD candidate with a keen interest and passion for psychology and technology.
            <br><br>
            Although my background has largely focused on software engineering, I quickly discovered that research into cognitive psychology was a uniquely engaging and creative means to use my coding experience.
            <br><br>My research focuses on using Virtual Reality as an immersive and powerful tool for collecting behavioural data. 
            I design experiments to isolate the moments our episodic memories are formed, and inference the long-term organisation of these memory networks.
            
            <br>However, I also enjoy involving myself in other areas of psychology, and have designed Virtual Reality investigations ranging from attention capture to perspective taking. 
            <br><br>
            Outside of research, I enjoy taking care of my two cats and aquariums.
        </p>
    </div>
    </section>

    <section id="publications" class="sectioned-content__section" aria-labelledby="publications-title">
        <h2 id="publications-title">Publications</h2>
        <article class="publications__article">
            <div class="publications__main">
                <p><b>Measuring the dynamics of attentional capture in hand and eye movements with virtual reality <span>(2026)</span></b>. Max D. Gurr, Jeff Moher, Matthew D. Egbert, Christopher D. Erb</p>
            </div>
            <div class="publications__link">
                <span>Behaviour Research Methods</span>
                <a href="https://doi.org/10.3758/s13428-026-03177-9" target="_blank" rel="noopener noreferrer">Read</a>
            </div>
        </article>
        <article class="publications__article">
            <div class="publications__main">
                <p><b>Location Updating Decreases Recognition Success in Immersive Virtual Reality.</b></p>
                <p>Max D. Gurr, Reece Roberts, Christopher D. Erb</p>
            </div>
            <div class="publications__link">
                <span>Memory & Cognition</span>
                <span><i>Under Review</i></span>
            </div>
        </article>
        <article class="publications__article">
            <div class="publications__main">
                <p><b>Recency Discrimination Depends on Multiple Forms of Context in Virtual Reality</b></p>
                <p>Max D. Gurr, Reece Roberts, Christopher D. Erb</p>
            </div>
            <div class="publications__link">
                <span>In Development</span>
            </div>
        </article>
    </section>

    <section id="education" class="sectioned-content__section" aria-labelledby="education-title">
      <h2 id="education-title">Education</h2>
      <p class="about-education__institution">University of Auckland</p>
      <div class="about-education__degrees">
        <div class="about-education__degree">Bachelor of Engineering (First Class Honours): Software Engineering</div>
        <div class="about-education__degree">Bachelor of Science: Psychology</div>
        <span class="about-education__gpa">GPA <strong>8.5</strong></span>
      </div>
      <div class="about-education__achievements">
        <h3>Achievements</h3>
        <div class="about-achievements">
          <div class="about-achievement">
            <span>PhD Scholarship</span>
            <span class="about-achievement__year">2023</span>
          </div>
          <div class="about-achievement">
            <span>Engineering Dean’s Honours List</span>
            <span class="about-achievement__year">2018 - 2021</span>
          </div>
          <div class="about-achievement">
            <span>Top Achiever Scholarship</span>
            <span class="about-achievement__year">2017</span>
          </div>
        </div>
      </div>
    </section>

    <section id="teaching" class="sectioned-content__section" aria-labelledby="teaching-title">
      <h2 id="teaching-title">Teaching</h2>
      <div class="about-teaching__heading">
        <h3>University of Auckland</h3>
        <span>Graduate Teaching Assistant</span>
      </div>
      <div class="about-teaching__details">
        <span class="about-teaching__dates">July 2022 - present</span>
      </div>
      <p>Supported student learning and group projects, marked coursework and tests, presented lab content, facilitated group discussions.</p>
      <div class="about-courses" aria-label="Courses taught">
        <div class="about-course">
          <strong>PSYCH 200</strong>
          <span>Developmental Psychology</span>
        </div>
        <div class="about-course">
          <strong>COMPSCI 335</strong>
          <span>Web Programming</span>
        </div>
        <div class="about-course">
          <strong>COMPSCI 331</strong>
          <span>Large-Scale Software Development</span>
        </div>
        <div class="about-course">
          <strong>COMPSCI 345</strong>
          <span>Human-Computer Interaction</span>
        </div>
        <div class="about-course">
          <strong>SOFTENG 310</strong>
          <span>Software Evolution and Maintenance</span>
        </div>
        <div class="about-course">
          <strong>SOFTENG 350</strong>
          <span>Human-Computer Interaction</span>
        </div>
      </div>
    </section>

    <section id="work-experience" class="sectioned-content__section" aria-labelledby="work-experience-title">
      <h2 id="work-experience-title">Work Experience</h2>
      <article class="about-experience">
        <h3>Numeracy123 <span>Web Development · August 2020 – March 2022</span></h3>
        <p>Built a full-stack web application with client/server architecture, production environment, and CI/CD pipeline; collaborated with a designer and stakeholders and gathered requirements.</p>
      </article>
      <article class="about-experience">
        <h3>Serato <span>Web Development Intern · November 2020 – March 2021</span></h3>
        <p>Member of team Jupiter; participated in team meetings, code reviews, and stakeholder meetings. Created webpages, fixed bugs, and contributed to the updated merchandise store.</p>
      </article>
      <article class="about-experience">
        <h3>LearnCOACH <span>Content Creator · May 2018 – February 2020</span></h3>
        <p>Designed and created NCEA courses for programming, with stakeholders including the Ministry of Education and various high schools across the country.</p>
      </article>
    </section>


    <section id="contact" class="sectioned-content__section" aria-labelledby="contact-title">
      <h2 id="contact-title">Contact</h2>
      <div class="about-contact">
        <a class="about-contact__panel" href="mailto:maxd.gurr@gmail.com">
          <span>Email</span>
          <strong>maxd.gurr@gmail.com</strong>
        </a>
        <a class="about-contact__panel" href="https://github.com/max-gurr" target="_blank" rel="noopener noreferrer">
          <span>GitHub</span>
          <strong>github.com/max-gurr</strong>
        </a>
      </div>
    </section>
  </SectionedContent>
</template>

<script>
import SectionedContent from '@/components/SectionedContent.vue';

export default {
  name: 'about-content',
  components: {
    SectionedContent
  },
  emits: ['back'],
  data: () => ({
    sections: [
      { id: 'profile', title: 'Profile' },
      { id: 'publications', title: 'Publications' },
        { id: 'education', title: 'Education' },
      { id: 'teaching', title: 'Teaching' },
      { id: 'work-experience', title: 'Work Experience' },
      { id: 'contact', title: 'Contact' }
    ]
  })
}
</script>

<style lang="scss">
.profile {
    &__panel {
        min-height: 6rem;
        gap: 0.5rem;
    }

    &__img {
        max-width: 25%;
        width: auto;
        height: auto;
        margin: 0px 0px 10px 10px;
        float: right;
    }
}

.publications {
    &__article {

        & + & {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(128, 189, 232, 0.2);
        }
        
        h3 {
            margin-bottom: 0.5rem;
        }
    }

    &__side {
        margin-left: auto;
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
        
        h3 {
            padding: 0px;
        }

        a {
            flex: 0 0 auto;
            padding: 0.5rem 0.75rem;
            border: 1px solid rgba(128, 189, 232, 0.35);
            border-radius: 999px;
            text-decoration: none;

            &:hover {
                background: rgba(128, 189, 232, 0.12);
            }
        }

        span {
            display: block;
            margin-top: 0.2rem;
            color: rgba(197, 225, 245, 0.65);
            font-weight: 400;
        }
    }

    &__link {
        margin-top: 0.5rem;
        padding: 1rem 1.25rem;
        border-left: 3px solid #80bde8;
        border-radius: 0 0.75rem 0.75rem 0;
        background: rgba(128, 189, 232, 0.08);
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        a {
            float: right;
        }
    }
}

.about-experience {
  & + & {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(128, 189, 232, 0.2);
  }

  h3 {
    margin-bottom: 0.5rem;
    color: #80bde8;
    font-size: 1.1rem;

    span {
      display: block;
      margin-top: 0.2rem;
      color: rgba(197, 225, 245, 0.65);
      font-size: 0.875rem;
      font-weight: 400;
    }
  }

  p + p {
    margin-top: 0.75rem;
  }
}

.about-teaching__details {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin: -0.25rem 0 0.5rem;
  color: rgba(197, 225, 245, 0.65);
  font-size: 0.875rem;
  text-align: right;
}

.about-teaching__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;

  h3 {
    margin: 0;
    color: #80bde8;
    font-size: 1.1rem;
  }

  span {
    color: #80bde8;
    font-size: 1.1rem;
  }
}

.about-courses {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.about-education {
  &__institution {
    margin-bottom: 1rem;
    color: #80bde8 !important;
    font-size: 1.1rem !important;
    font-weight: 700;
  }

  &__degrees {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.75rem;
  }

  &__degree {
    display: flex;
    align-items: center;
    color: #c5e1f5;
    line-height: 1.5;
  }

  &__gpa {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 5.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid rgba(128, 189, 232, 0.45);
    border-radius: 999px;
    background: rgba(128, 189, 232, 0.14);
    color: #c5e1f5;
    font-size: 0.875rem;
    white-space: nowrap;

    strong {
      font-size: 1.5rem;
      line-height: 1.1;
    }
  }

  &__achievements {
    margin-top: 1.25rem !important;

    h3 {
      margin-bottom: 0.5rem;
      color: #80bde8;
      font-size: 1.1rem;
    }

  }
}

.about-achievements {
  display: grid;
  gap: 0.25rem;
}

.about-achievement {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(197, 225, 245, 0.88);
  line-height: 1.5;

  &__years {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  &__year {
    display: inline-flex;
    min-width: 3.5rem;
    justify-content: center;
    padding: 0.25rem 0.6rem;
    border: 1px solid rgba(128, 189, 232, 0.35);
    border-radius: 999px;
    background: rgba(128, 189, 232, 0.12);
    color: #c5e1f5;
    font-size: 0.85rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.about-course {
  min-height: 3rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(128, 189, 232, 0.24);
  border-radius: 0.75rem;
  background: rgba(128, 189, 232, 0.08);
  color: #c5e1f5;

  strong {
    font-size: 0.95rem;
  }

  span {
    color: rgba(197, 225, 245, 0.7);
    font-size: 0.875rem;
  }
}

.about-contact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  &__panel {
    display: flex;
    min-height: 6rem;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem;
    border: 1px solid rgba(128, 189, 232, 0.24);
    border-radius: 0.75rem;
    background: rgba(128, 189, 232, 0.08);
    color: #c5e1f5;
    text-decoration: none;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    span {
      color: rgba(197, 225, 245, 0.65);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    strong {
      overflow-wrap: anywhere;
    }

    &:hover {
      border-color: rgba(128, 189, 232, 0.6);
      background: rgba(128, 189, 232, 0.14);
    }

    &:focus-visible {
      outline: 2px solid #80bde8;
      outline-offset: 3px;
    }
  }
}

@media (max-width: 560px) {
  .profile {
    &__panel {
        display: flex;
        flex-direction: column;
    }

    &__img {
        max-width: 250px;
        margin: 0 auto;
    }
}   

.publications__article {
    flex-direction: row;
}

  .about-education__degrees {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
  }

  .about-education__degree {
    padding: 0;
  }

  .about-achievement {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
  }

  .about-achievement__years {
    justify-content: flex-start;
  }

  .about-contact {
    grid-template-columns: 1fr;
  }

  .about-teaching__details {
    justify-content: flex-end;
  }

  .about-teaching__heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }
}

.sectioned-content__section a {
  color: #80bde8;
  overflow-wrap: anywhere;
}
</style>
