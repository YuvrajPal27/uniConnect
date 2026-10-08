import UniversityCollectionEditor from "../Shared/UniversityCollectionEditor";
import { moduleConfigs } from "../../config/moduleConfigs";

export default function Budget() {
  return <UniversityCollectionEditor config={moduleConfigs.budget} />;
}
