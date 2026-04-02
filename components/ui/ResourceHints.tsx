// Server component — emits <link> resource hints in the <head>
export function ResourceHints() {
  return (
    <>
      {/* Preconnect to Supabase */}
      <link rel="preconnect" href="https://jayxqyylmpnzkwvskzig.supabase.co" />
      <link rel="dns-prefetch" href="https://jayxqyylmpnzkwvskzig.supabase.co" />
    </>
  );
}
