import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const { id } = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: id }),
    staleTime: 10000
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ["events", id] });
  //     const prevData = queryClient.getQueryData(["events", id]);

  //     queryClient.setQueryData(["events", id], newEvent);

  //     return { prevEvent: prevData };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", id], context.prevEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", id]);
  //   },
  // });

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
    // mutate({ id: id, event: formData });
    // navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError)
    content = (
      <>
        <ErrorBlock
          title="Failed to fetch an event"
          message={
            error.info?.message ||
            "Failed to load an event. Please check inputs and try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export const loader = ({ req, params }) => {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
};

export const action = async ({ request, params }) => {
  const fd = await request.formData();
  const updatedFD = Object.fromEntries(fd);
  await updateEvent({ id: params.id, event: updatedFD });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
};
