import { useParams, useSearchParams } from "react-router-dom";
import ConversationView from "@/components/ConversationView";

/** /messagerie/:id?with=:userId : conversation en plein écran (téléphone et liens existants). */
const Messaging = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const withUserId = params.get("with");
  if (!id) return null;
  return <ConversationView key={`${id}:${withUserId ?? ""}`} searchId={id} withUserId={withUserId} />;
};

export default Messaging;
