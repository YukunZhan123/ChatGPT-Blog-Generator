import { faBlog, faBook, faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Logo = () => {
  return (
    <div className="text-3xl text-center py-4 font-heading">
      BlogGenerator
      <FontAwesomeIcon icon={faBlog} className="text-2xl text-slate-400 pl-2" />
    </div>
  );
};
