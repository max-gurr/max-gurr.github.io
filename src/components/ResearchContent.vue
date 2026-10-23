<template>
  <SectionedContent title="Research" :sections="sections" @back="$emit('back')">
    <section id="phd-memory-1" class="sectioned-content__section" aria-labelledby="phd-memory-title">
        <h2 id="phd-memory-title">Location Updating Affects Object Recognition in Virtual Reality</h2>
        <div class="research__container">
            <div class="research__text">
                <h3>CMND Lab - University of Auckland</h3>
                <p class="research__text">Participants studied a collection of objects arranged on a table. After passing through a doorway, participants were less accurate and slower at recognising previously studied objects. Placing recognised objects at the remembered location was as precise when changing locations as when remaining in the same location.</p>
            </div>
            <VideoShowcase
                class="research__video"
                poster="tableMemory-Thumbnail.jpg"
                videoId="H6rQINZGB8c"
                alt="Screenshot of the virtual reality experiment"
                label="Play video: location updating experiment"
            />
            <article class="research__article">
                <h4>Memory impairments for recently studied objects after changing locations</h4>
                <p class="research__content__status">Under review</p>
                <a href="https://osf.io/s8h4p/" target="_blank" rel="noopener noreferrer">OSF project</a>
            </article>
        </div>
    </section>

    <section id="phd-memory-2" class="sectioned-content__section" aria-labelledby="phd-memory-title">
        <h2 id="phd-memory-title">Recency Discrimination Degrades with Increasing Contextual Mismatch</h2>
        <div class="research__container">
            <div class="research__text">
                <h3>CMND Lab - University of Auckland</h3>
                <p>Participants judged collections of objects in six unique houses. Recency discrimination was more accurate between items studied in the same house compared to items studied in separate houses. Further, across-house recency discrimination was more accurate when the two objects were studied with the same judgement task.</p>
            </div>
            <VideoShowcase
                class="research__video"
                poster="ContextMemory-Thumbnail.jpg"
                videoId="8c7SN5yQijQ"
                alt="Screenshot of the virtual reality experiment"
                label="Play video: location updating experiment"
            />
            <article class="research__article">
                <h4>Recency discrimination performance driven by overlap of both spatial and task context</h4>
                <p class="research-publications__status">Manuscript in preparation</p>
            </article>
        </div>
    </section>

    <section id="phd-memory-3" class="sectioned-content__section" aria-labelledby="phd-memory-title">
        <h2 id="phd-memory-title">The Doorway Effect in a Procedural Space Station</h2>
        <div class="research__container">
            <div class="research__text">
                <h3>CMND Lab - University of Auckland</h3>
                <p>In a continuously-generated space station, participants sorted a series of objects into a trash bin or transport box, before carrying the box to another location. <br>Movements were made within a single room, into a separate room, or into a separate room then back into the original room. 
                    <br>Results to come!</p>
            </div> 
            <VideoShowcase
                class="research__video"
                poster="DoorwayMemory-Thumbnail.jpg"
                videoId="ecmw7EQOlpg"
                alt="Screenshot of the virtual reality experiment"
                label="Play video: location updating experiment"
            />
            <article class="research__article">
                <h4>The Doorway Effect in Virtual Reality</h4>
                <p class="research-publications__status">Data collection ongoing</p>
            </article>
        </div>
    </section>

    <section id="singleton-detection" class="sectioned-content__section research-singleton" aria-labelledby="singleton-detection-title">
        <h2 id="phd-memory-title">Singleton Detection</h2>
        <div class="research__container">
            <div class="research__text">
                <h3>CMND Lab - University of Auckland</h3>
                <p class="research__text">In a detailed greenhouse and an empty room, participants searched for a uniquely-shaped target among an array of four apples & pears.<br>When a non-target fruit was presented in a salient colour, both reach movements and gaze strategies were drawn toward the distracting stimulus. No difference was observed in distractor effects between the richly-detailed and sparsely-detailed rooms.
                <br><br>For this manuscript, I created a new measure of "reach attraction", which quantifies how a reach trajectory is drawn towards multiple response locations</p>
            </div>
            <VideoShowcase
                class="research__video"
                poster="Singleton-Thumbnail.jpg"
                videoId="yivNUNFVjlg"
                alt="Screenshot of the virtual reality experiment"
                label="Play video: location updating experiment"
            />
            <article class="research__article">
                <h4>Measuring the dynamics of attentional capture in hand and eye movements with virtual reality. (2026)</h4>
                <p class="research-publications__status">Max D. Gurr, Jeff Moher, Matthew D. Egbert, Christopher D. Erb</p>
                <a href="https://doi.org/10.3758/s13428-026-03177-9" target="_blank" rel="noopener noreferrer">Read the publication</a>
            </article>
        </div>
    </section>
 
    <section id="ghost-trio" class="sectioned-content__section" aria-labelledby="ghost-trio-title">
      <h2 id="ghost-trio-title">Ghost Trio</h2>
        <h3>CMND Lab - University of Auckland</h3>
      <p>Development lead for a Virtual Reality reproduction of Samuel Beckett’s “Ghost Trio”, investigating whether immersion and engagement influence interpretation and understanding of a play.</p>
      <p>Used Unity to model the set and manually animate the movements of each actor.</p>
    </section>

    <section id="brain-connectivity" class="sectioned-content__section" aria-labelledby="brain-connectivity-title">
      <h2 id="brain-connectivity-title">Functional Brain Connectivity Analysis</h2>
      <h3 class="research-section-subheading research-brain__subtitle">Software Engineering Honours Research</h3>
      <p class="research-brain__intro">Compared standard off-the-shelf fMRI parcellations with machine-learning parcellations generated for each individual. 
        Machine-learning parcellations showed more consistent differences between healthy individuals and individuals with Parkinson's.</p>
      <div class="research-brain__workflow">
        <article>
          <span class="research-brain__step">Approach</span>
          <p>Created per-participant brain parcellations using k-means and Ward clustering.</p>
          <p class="research-brain__tool">Python + Nilearn</p>
        </article>
        <article>
          <span class="research-brain__step">Analysis</span>
          <p>Generated functional connectivity matrices and compared graph-based network measures between healthy participants and participants with Parkinson’s disease.</p>
          <p class="research-brain__tool">Matlab</p>
        </article>
      </div>
    </section>
  </SectionedContent>
</template>

<script>
import SectionedContent from '@/components/SectionedContent.vue';
import VideoShowcase from '@/components/VideoShowcase.vue';

export default {
  name: 'research-content',
  components: {
    SectionedContent,
    VideoShowcase
  },
  emits: ['back'],
  data: () => ({
    sections: [
      { id: 'phd-memory-1', title: 'Location Updataing' },
      { id: 'phd-memory-2', title: 'Recency Discrimination' },
      { id: 'phd-memory-3', title: 'Doorway Effect' },
      { id: 'singleton-detection', title: 'Singleton Detection' },
      { id: 'ghost-trio', title: 'Ghost Trio' },
      { id: 'brain-connectivity', title: 'Functional Brain Connectivity Analysis' }
    ]
  })
}
</script>

<style lang="scss">
.research {
    &__container {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: 1fr;

        article {
            padding: 1rem 1.25rem;
            border-left: 3px solid #80bde8;
            border-radius: 0 0.75rem 0.75rem 0;
            background: rgba(128, 189, 232, 0.08);
        }

        h3 {
            color: #c5e1f5;
            font-size: 1rem;
            line-height: 1.45;
        }

        p {
            margin-right: 0.25rem;
        }

        a {
            display: inline-block;
            margin-top: 0.5rem;
            color: #80bde8;
        }

        &__status {
            color: rgba(197, 225, 245, 0.62) !important;
            font-size: 0.9rem !important;
            font-style: italic;
        }
    }

    &__video {
        max-width: 100vw;
    }

    @media (min-width: 768px) {
        &__container {
            grid-template-columns: 1fr auto;  
        }

        &__text    { grid-column: 1; grid-row: 1; }
        &__video   { grid-column: 2; grid-row: 1; margin-top: 0; max-width: min(250px, 25vw); }
        &__article { grid-column: 1 / -1; grid-row: 2; } // spans both columns
    }
    
}

.sectioned-content__section {
  h3 {
    margin: 0 0 0.5rem;
    color: #80bde8;
    font-size: 1.05rem;
  }

  a {
    color: #80bde8;
    overflow-wrap: anywhere;
  }
}

.research-section-subheading {
  margin-top: 1.25rem !important;
  margin-bottom: 0.5rem !important;
  color: #80bde8 !important;
  font-size: 1.05rem !important;
}

.research-experiments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  align-items: stretch;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem !important;
  padding: 0 !important;
  list-style: none;

  li {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    margin-top: 0 !important;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(128, 189, 232, 0.3);
    border-radius: 0.75rem;
    background: linear-gradient(135deg, rgba(128, 189, 232, 0.12), rgba(128, 189, 232, 0.035));
    color: rgba(197, 225, 245, 0.88);
    line-height: 1.4;
    text-align: center;
    box-shadow: inset 0 1px rgba(197, 225, 245, 0.06);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
}

.research-brain {
  &__subtitle {
    margin-top: 0 !important;
  }

  &__intro {
    margin-bottom: 1.25rem !important;
  }

  &__workflow {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;

    article {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border: 1px solid rgba(128, 189, 232, 0.24);
      border-radius: 0.75rem;
      background: rgba(128, 189, 232, 0.07);
    }

    p {
      margin-top: 0.4rem;
    }
  }

  &__step,
  &__finding > span,
  &__tools > span:first-child {
    color: #80bde8;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__tool {
    margin-top: auto !important;
    padding-top: 0.65rem;
    border-top: 1px solid rgba(128, 189, 232, 0.18);
    color: rgba(197, 225, 245, 0.65) !important;
    font-size: 0.9rem !important;
  }

  &__finding {
    margin-top: 0.75rem;
    padding: 1rem 1.25rem;
    border-left: 3px solid #80bde8;
    border-radius: 0 0.75rem 0.75rem 0;
    background: rgba(128, 189, 232, 0.1);

    p {
      margin-top: 0.35rem;
    }
  }

}

.research-singleton {
  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;

    h2 {
      margin: 0;
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
  }

  ul {
    margin-top: 1rem;
  }

  &__responsibilities {
    margin-left: 0 !important;
    list-style: none;

    li {
      display: grid;
      grid-template-columns: 0.4rem minmax(0, 1fr);
      align-items: start;
      gap: 0.65rem;
      padding: 0.35rem 0;
      color: rgba(197, 225, 245, 0.88);
      line-height: 1.5;

      &::before {
        content: '';
        width: 0.35rem;
        height: 0.35rem;
        margin-top: 0.55rem;
        border-radius: 50%;
        background: #80bde8;
      }

      & + li {
        border-top: 1px solid rgba(128, 189, 232, 0.16);
      }
    }
  }
}

@media (max-width: 560px) {
    .research__container {
        flex-direction: column;
    }

    .research__content {
        width: 100%;
    }

  .research-singleton__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .research-experiments {
    grid-template-columns: 1fr;
  }

  .research-brain__workflow {
    grid-template-columns: 1fr;
  }

}
</style>
