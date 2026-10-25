/** Sparse animated deep-space backdrop. Pure CSS motion; hidden from AT. */
export function StarField() {
  return (
    <div className="starfield" aria-hidden>
      <span className="stars-a" />
      <span className="stars-b" />
    </div>
  );
}
