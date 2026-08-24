export default function ConfirmModal({
  message,
  onCancel,
  onConfirm,
  loading
}) {

  return (

    <div className="modal-overlay">

      <div className="confirm-box">

        <h3>
          Confirmation
        </h3>

        <p>
          {message}
        </p>


        <div className="confirm-actions">

          <button
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            NO
          </button>


          <button
            className="save-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "YES"}
          </button>


        </div>

      </div>

    </div>

  );

}