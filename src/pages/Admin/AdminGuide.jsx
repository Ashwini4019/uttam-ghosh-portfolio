const GUIDES = {
  categories: {
    title: "Update homepage artwork",
    where: "Shown in Browse by Category on the home page.",
    steps: [
      "Choose a gallery, then add photos.",
      "The first photo is the cover visitors see first.",
      "Click Save to website — edits stay private until then.",
    ],
  },
  places: {
    title: "Update Places Visited",
    where: "Shown in the About section of the home page.",
    steps: [
      "Open a place and add photos from that trip or assignment.",
      "The first photo is the cover on the place card.",
      "Click Save to website when the set looks right.",
    ],
  },
  about: {
    title: "Update the About story",
    where: "Shown in the About section on the home page.",
    steps: [
      "Edit the short quote and bio paragraphs.",
      "Add or change career chapters in the timeline.",
      "Click Save to website.",
    ],
  },
  newsletter: {
    title: "Newsletter sign-ups",
    where: "People who asked for email updates from the contact form.",
    steps: [
      "See who signed up, and download the list if needed.",
      "Connect Gmail if you want welcome emails to actually arrive.",
      "People can still subscribe even if email sending is off.",
    ],
  },
};

const AdminGuide = ({ tab }) => {
  const guide = GUIDES[tab];
  if (!guide) return null;

  return (
    <section className="admin-guide" aria-label="How to use this page">
      <div className="admin-guide-copy">
        <h2>{guide.title}</h2>
        <p>{guide.where}</p>
      </div>
      <ol className="admin-guide-steps">
        {guide.steps.map((step, index) => (
          <li key={step}>
            <span className="admin-guide-step-num" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default AdminGuide;
