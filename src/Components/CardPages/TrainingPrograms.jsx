import UniversityCollectionEditor from "../Shared/UniversityCollectionEditor";
import { moduleConfigs } from "../../config/moduleConfigs";

export default function TrainingPrograms() {
  return <UniversityCollectionEditor config={moduleConfigs.trainingPrograms} />;
}
