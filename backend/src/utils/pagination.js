export const getPaginationData = (total, page, limit) => {
  const totalInt = parseInt(total, 10) || 0;
  const pageInt = parseInt(page, 10) || 1;
  const limitInt = parseInt(limit, 10) || 10;

  return {
    total: totalInt,
    page: pageInt,
    limit: limitInt,
    totalPages: Math.ceil(totalInt / limitInt),
  };
};

export const parsePaginationParams = (queryPage, queryLimit) => {
  const page = parseInt(queryPage, 10) || 1;
  const limit = parseInt(queryLimit, 10) || 10;
  return { page, limit };
};
