<template>
  <SectionedContent title="Research" :sections="sections" @back="$emit('back')">
    <section id="phd-memory" class="sectioned-content__section" aria-labelledby="phd-memory-title">
      <h2 id="phd-memory-title">PhD: Memory Encoding & Organisation</h2>
      <p>My thesis uses Virtual Reality to investigate how we encode and remember everyday experiences, based on the framework of Event Segmentation Theory.</p>
      <div class="research-publications">
        <article>
          <h3>Memory impairments for recently studied objects after changing locations</h3>
          <p>Participants studied a collection of objects arranged on a table. After passing through a doorway, participants were less accurate and slower at recognising previously studied objects. Placing recognised objects at the remembered location was as precise when changing locations as when remaining in the same location.</p>
          <p class="research-publications__status">Under review</p>
          <a href="https://osf.io/s8h4p/" target="_blank" rel="noopener noreferrer">OSF project</a>
        </article>
        <article>
          <h3>Recency discrimination performance driven by overlap of both spatial and task context</h3>
          <p>Participants judged collections of objects in six unique houses. Recency discrimination was more accurate between items studied in the same house compared to items studied in separate houses. Further, across-house recency discrimination was more accurate when the two objects were studied with the same judgement task.</p>
          <p class="research-publications__status">Manuscript in preparation</p>
        </article>
        <article>
          <h3>Recognition performance for items carried through a sequence of rooms</h3>
          <p>Participants sorted a series of objects into a trash bin or transport box, before carrying the box to another location. Movements may be made within a single room, into a separate room, or into a separate room then back into the original room.</p>
          <p class="research-publications__status">Data collection ongoing</p>
        </article>
      </div>
    </section>

    <section id="singleton-detection" class="sectioned-content__section research-singleton" aria-labelledby="singleton-detection-title">
      <div class="research-singleton__heading">
        <h2 id="singleton-detection-title">Singleton Detection</h2>
        <a href="https://doi.org/10.3758/s13428-026-03177-9" target="_blank" rel="noopener noreferrer">Read the publication</a>
      </div>
      <p>First-author publication in Behaviour Research Methods exploring singleton detection and distractor suppression in a Virtual Reality paradigm.</p>
      <ul class="research-singleton__responsibilities">
        <li>Programmed the experiment</li>
        <li>Created data-processing software for hand & gaze data</li>
        <li>Developed a novel “reach attraction” measure to quantify how a reach trajectory is influenced by competing response targets.</li>
        <li>Conducted statistical analyses using R</li>
        <li>Led manuscript development</li>
      </ul>
    </section>

    <section id="cmnd-lab" class="sectioned-content__section" aria-labelledby="cmnd-lab-title">
      <h2 id="cmnd-lab-title">CMND Lab</h2>
      <h3 class="research-section-subheading">Virtual Reality for Cognitive Psychology</h3>
      <p>Involved in the operation of the CMND lab since late 2022, creating analysis software, programming Virtual Reality experiences, and collecting in-person participant data.</p>
      <ul class="research-experiments" aria-label="Experiments">
        <li>Attention control and inhibition</li>
        <li>Task switching</li>
        <li>Visual search</li>
        <li>Perspective taking</li>
        <li>Emotion recognition</li>
        <li>Material perception</li>
        <li>Sensorimotor control</li>
        <li>Memory organisation</li>
      </ul>
      <h3>Data Analysis</h3>
      <p>Created a Python graphical user interface for visualising and processing hand- and eye-tracking data from VR experiments. It is now used by students in the lab for their VR investigations.</p>
    </section>

    <section id="ghost-trio" class="sectioned-content__section" aria-labelledby="ghost-trio-title">
      <h2 id="ghost-trio-title">Ghost Trio</h2>
      <p>Development lead for a Virtual Reality reproduction of Samuel Beckett’s “Ghost Trio”, investigating whether immersion and engagement influence interpretation and understanding of a play.</p>
      <p>Used Unity to model the set and manually animate the movements of each actor.</p>
    </section>

    <section id="brain-connectivity" class="sectioned-content__section" aria-labelledby="brain-connectivity-title">
      <h2 id="brain-connectivity-title">Functional Brain Connectivity Analysis</h2>
      <h3 class="research-section-subheading research-brain__subtitle">Software Engineering Honours Research</h3>
      <p class="research-brain__intro">Using machine learning to improve our understanding of fMRI scans.</p>
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
      <div class="research-brain__finding">
        <span>Key finding</span>
        <p>Compared with standard off-the-shelf parcellations, the generated parcellations showed more consistent differences between healthy participants nad participants with Parkinson's.</p>
      </div>
    </section>
  </SectionedContent>
</template>

<script>
import SectionedContent from '@/components/SectionedContent.vue';

export default {
  name: 'research-content',
  components: {
    SectionedContent
  },
  emits: ['back'],
  data: () => ({
    sections: [
      { id: 'phd-memory', title: 'PhD: Memory Encoding & Organisation' },
      { id: 'singleton-detection', title: 'Singleton Detection' },
      { id: 'cmnd-lab', title: 'CMND Lab' },
      { id: 'ghost-trio', title: 'Ghost Trio' },
      { id: 'brain-connectivity', title: 'Functional Brain Connectivity Analysis' }
    ]
  })
}
</script>

<style lang="scss">
.research-publications {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

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
    margin-top: 0.4rem;
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

.sectioned-content__section {
  h3 {
    margin: 1.25rem 0 0.5rem;
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

    &:hover {
      border-color: rgba(128, 189, 232, 0.55);
      background-color: rgba(128, 189, 232, 0.1);
    }
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
