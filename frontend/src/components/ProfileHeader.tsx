import { Camera, MapPin, ShieldCheck } from "lucide-react";
import type { Profile } from "../types";
export function ProfileHeader({
  profile,
  onPhoto,
}: {
  profile: Profile;
  onPhoto: (file: File) => void;
}) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
  return (
    <div className="profile-card">
      <div className="cover">
        <div className="cover-orb orb-one" />
        <div className="cover-orb orb-two" />
        <div className="cover-grid" />
      </div>
      <div className="identity">
        <label className="avatar-wrap">
          {profile.photoUrl ? (
            <img className="avatar" src={profile.photoUrl} alt="Profile" />
          ) : (
            <div className="avatar avatar-initials">{initials}</div>
          )}
          <span className="camera">
            <Camera size={15} />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) =>
                e.target.files?.[0] && onPhoto(e.target.files[0])
              }
            />
          </span>
        </label>
        <div className="identity-copy">
          <div className="name-line">
            <h2>
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="verified">
              <ShieldCheck size={14} /> Verified
            </span>
          </div>
          <p>
            Product Designer <span>·</span> Design team
          </p>
          <div className="location">
            <MapPin size={14} />{" "}
            {profile.contact.address || "Add your location"}
          </div>
        </div>
        <div className="profile-status">
          <span className="status-dot" /> ACTIVE MEMBER
        </div>
      </div>
    </div>
  );
}
