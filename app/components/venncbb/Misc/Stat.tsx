import { NAMEMAP } from "../../../lib/maps";

const Stat = ({ name }: { name: string }) => {
  if (name in NAMEMAP) {
    return (
      <div className={`${name} noselect`}>
        {NAMEMAP[name as keyof typeof NAMEMAP]}
      </div>
    );
  }
  return <div className="noselect">{name.replaceAll("_", " ")}</div>;
};

export default Stat;
