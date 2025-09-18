# Designing REST API pagination

Designing REST API pagination for a PostgreSQL backend typically involves two main approaches: Offset-based pagination and Keyset-based (or Cursor-based) pagination.

## Offset-based Pagination

This is the most common and straightforward method.

API Design:

-   Endpoint: /api/resources?page={page_number}&size={page_size} or /api/resources?offset={offset}&limit={limit}
-   Parameters:
    -   page (or offset): Specifies the starting point for retrieving data.
    -   size (or limit): Specifies the number of items to return per page.
-   Response:
    -   An array of resource objects.
    -   Metadata including total_items, current_page, total_pages, page_size, and potentially next_page_url and prev_page_url.

PostgreSQL Query:

```sql
SELECT \*
FROM your_table
ORDER BY id -- or any other relevant column for consistent ordering
OFFSET :offset
LIMIT :limit;
```

Considerations:

-   Pros: Easy to implement, allows direct access to any page.
-   Cons: Performance degrades for large offsets as the database still processes all preceding rows. Can lead to "phantom reads" if data is added or removed between pages, causing items to appear on multiple pages or be missed entirely.

## Keyset-based (Cursor-based) Pagination

This method uses the values of specific columns from the last item of the previous page to fetch the next page, improving performance and accuracy.
API Design:

-   Endpoint: /api/resources?after={last_item_id}&limit={limit} (or similar, using relevant key values)
-   Parameters:
    -   after: The value of a unique, sortable column (e.g., primary key, timestamp) from the last item of the previously fetched page.
    -   limit: The number of items to return.
-   Response:
    -   An array of resource objects.
    -   A next_cursor (or last_item_id) to be used for the next request.

PostgreSQL Query:

```sql
SELECT \*
FROM your_table
WHERE id > :last_item_id -- assuming 'id' is the sortable key
ORDER BY id
LIMIT :limit;
```

## Considerations:

-   Pros: Much more efficient for large datasets as it avoids scanning preceding rows. More robust against data changes (no phantom reads).
-   Cons: More complex to implement, requires a unique and consistently sortable column, and typically only allows forward (and sometimes backward) navigation, not direct jumping to arbitrary pages.

## General Best Practices:

-   Consistent Ordering: Always include an ORDER BY clause in your PostgreSQL queries to ensure consistent pagination results.
-   Security: Validate and sanitize all input parameters (page, size, offset, limit, after) to prevent SQL injection and other vulnerabilities.
-   Error Handling: Provide clear error messages for invalid pagination parameters.
-   HATEOAS (Optional): Include links to next, prev, first, and last pages in the API response for better navigability.
