
 //Created by Prince Raj — October 2025
  //GitHub:


import { useState, useEffect } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"

// Types ...
interface Artwork {
  id: number
  title: string
  artist_display: string
  image_id: string | null
}

export default function ArtworksTable() {
  //  State variables ...
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const [, setSelectAll] = useState(false)

  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 12,
    page: 1,
    sortField: undefined as string | undefined,
    sortOrder: undefined as 1 | 0 | -1 | undefined,
    filters: {
      id: { value: "", matchMode: "contains" as const },
      title: { value: "", matchMode: "contains" as const },
      artist_display: { value: "", matchMode: "contains" as const },
    },
  });

  //  Helper to fetch artwork data ...
  const fetchArtworks = async (page: number, limit: number) => {
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&cb=${Date.now()}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch artworks: ${response.statusText}`)
      }

      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total)
    } catch (err) {
      console.error("Error fetching artworks:", err)
      setError("Unable to load artworks. Please try again later.")
    } finally {
      setLoading(false);
    }
  };

  //  Debounced lazy loading ...
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const page = lazyState.first / lazyState.rows + 1;
      fetchArtworks(page, lazyState.rows)
    }, 400); // delay to prevent too frequent API calls

    return () => clearTimeout(timeout);
  }, [lazyState]);

  // Event handlers ...
  const handlePageChange = (event: any) => {
    setLazyState((prev) => ({
      ...prev,
      ...event,
      page: event.page + 1,
    }));
  };

  const handleSort = (event: any) => {
    setLazyState((prev) => ({
      ...prev,
      ...event,
    }));
  };

  const handleFilter = (event: any) => {
    setLazyState((prev) => ({
      ...prev,
      ...event,
      first: 0,
    }));
  };

  const handleSelectionChange = (event: any) => {
    const value = event.value;
    setSelectedArtworks(value);
    setSelectAll(value.length === totalRecords);
  };

  // --- Template for artwork image ---
  const imageBodyTemplate = (rowData: Artwork) => {
    if (!rowData.image_id) return <span style={{ color: "#999" }}>No Image</span>;

    return (
      <img
        src={`https://www.artic.edu/iiif/2/${rowData.image_id}/full/100,/0/default.jpg`}
        alt={rowData.title}
        style={{
          width: "60px",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
    );
  };

  // --- UI Rendering ---
  return (
    <div className="card">
      <h2 className="mb-3 text-xl font-semibold text-gray-800">Artworks Gallery</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
           {error}
        </div>
      )}

      <DataTable
        value={artworks}
        paginator
        lazy
        dataKey="id"
        filterDisplay="row"
        loading={loading}
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalRecords}
        onPage={handlePageChange}
        onSort={handleSort}
        onFilter={handleFilter}
        filters={lazyState.filters}
        sortField={lazyState.sortField ?? undefined}
        sortOrder={lazyState.sortOrder ?? undefined}
        selection={selectedArtworks}
          selectionMode="multiple" 
        onSelectionChange={handleSelectionChange}
        tableStyle={{ minWidth: "75rem" }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          field="id"
          header="ID"
          sortable
          filter
          filterPlaceholder="Search ID"
        />
        <Column
          field="title"
          header="Title"
          sortable
          filter
          filterPlaceholder="Search Title"
        />
        <Column
          field="artist_display"
          header="Artist"
          sortable
          filter
          filterPlaceholder="Search Artist"
        />
        <Column header="Image" body={imageBodyTemplate} />
      </DataTable>
    </div>
  );
}
