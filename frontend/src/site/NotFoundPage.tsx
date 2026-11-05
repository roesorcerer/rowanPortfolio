import { useEffect } from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found | Rowan Stratton";
  }, []);

  return (
    <section className="sec" aria-labelledby="missing-h">
      <h1 id="missing-h" className="d strip">
        A wall
      </h1>
      <div className="sec-body stack">
        <p className="lead">There is no page at this address. The link may be mistyped.</p>
        <div className="actions">
          <Link className="cmd primary" to="/">
            Back to the home page
          </Link>
          <Link className="cmd" to="/#work">
            See my work
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
