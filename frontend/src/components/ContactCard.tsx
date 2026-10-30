import { useState } from "react";
import { AtSign, Check, MapPin, Pencil, Phone, X } from "lucide-react";
import type { Contact } from "../types";
const fields = [
  {
    key: "mobile",
    label: "Mobile phone",
    icon: Phone,
    placeholder: "+66 81 234 5678",
  },
  {
    key: "email",
    label: "Email address",
    icon: AtSign,
    placeholder: "you@company.com",
  },
  {
    key: "address",
    label: "Home address",
    icon: MapPin,
    placeholder: "City, Country",
  },
] as const;
export function ContactCard({
  contact,
  onSave,
  loading,
}: {
  contact: Contact;
  onSave: (c: Contact) => Promise<void>;
  loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(contact);
  const submit = async () => {
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      /* Keep the form open so the user can correct or retry. */
    }
  };
  return (
    <section className="panel contact-panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">PERSONAL DETAILS</div>
          <h3>Contact information</h3>
          <p>How people can get in touch with you.</p>
        </div>
        {editing ? (
          <div className="button-row">
            <button
              className="icon-button"
              onClick={() => {
                setDraft(contact);
                setEditing(false);
              }}
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
            <button
              className="primary small"
              onClick={submit}
              disabled={loading}
            >
              <Check size={15} /> Save
            </button>
          </div>
        ) : (
          <button
            className="secondary small"
            onClick={() => {
              setDraft(contact);
              setEditing(true);
            }}
          >
            <Pencil size={14} /> Edit details
          </button>
        )}
      </div>
      <div className="contact-list">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div className="contact-row" key={key}>
            <div className="contact-icon">
              <Icon size={17} />
            </div>
            <div className="contact-field">
              <label>{label}</label>
              {editing ? (
                <input
                  value={draft[key]}
                  placeholder={placeholder}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              ) : (
                <span className={contact[key] ? "" : "muted"}>
                  {contact[key] || "Not provided"}
                </span>
              )}
            </div>
            {!editing && <span className="private-tag">PRIVATE</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
