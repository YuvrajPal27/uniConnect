import UniversityCollectionEditor from "../Shared/UniversityCollectionEditor";
import { moduleConfigs } from "../../config/moduleConfigs";

export default function Enrollment() {
  return <UniversityCollectionEditor config={moduleConfigs.enrollment} />;
}
