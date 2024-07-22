import numpy as np
from scipy.linalg import lstsq


def generate_isograph(samples, order, dim_sample_count):
    """
    :param samples: A Nx3 matrix, represented as a 2d array, of [lat, lng, cost]
    :param order: The order of the polynomial to generate
    :param dim_sample_count: Number of samples to take along each dimension (latitude and latitude)
    :return: An array of [lng, lat, cost] points sampled from the polynomial that best fits the data
    """
    lat, lng, cost = format_data(samples)

    powers = [(x, y) for n in range(0, order + 1) for y in range(0, n + 1) for x in range(0, n + 1) if x + y == n]
    powers_lat = np.asarray([[x] for x, _ in powers]).T
    powers_lng = np.asarray([[y] for _, y in powers]).T

    regression_matrix = (lat ** powers_lat) * (lng ** powers_lng)
    coefficients, _, _, _ = lstsq(regression_matrix, cost)
    return sample_polynomial(dim_sample_count, lat, lng, powers_lat, powers_lng, coefficients)


def sample_polynomial(dimension_sample_count, lat, lng, powers_lat, powers_lng, coefficients):
    """
    :param dimension_sample_count: Number of samples to take along each dimension (latitude and latitude)
                                    of the polynomial
    :param lat: A matrix representing the latitude samples originally collected
    :param lng: A matrix representing the longitude samples originally collected
    :param powers_lat: A matrix consisting of the polynomial powers of the estimated polynomial,
                        for the latitude independent variable
    :param powers_lng: A matrix consisting of the polynomial powers of the estimated polynomial,
                        for the longitude independent variable
    :param coefficients: A matrix consisting of the coefficients of the estimated polynomial
    :return: An array of [lng, lat, cost] samples on the estimated polynomial, where cost > 0
    """
    estimate_sample_lat, estimate_sample_lng = np.meshgrid(
        np.linspace(lat.min(), lat.max(), dimension_sample_count),
        np.linspace(lng.min(), lng.max(), dimension_sample_count))

    estimation_matrix = (estimate_sample_lat.reshape(-1, 1) ** powers_lat) * (
            estimate_sample_lng.reshape(-1, 1) ** powers_lng)
    estimate_cost = np.dot(estimation_matrix, coefficients).reshape(estimate_sample_lat.shape)

    # clip any negative cost estimates and reshape into 3 columns of [lng, lat, cost]
    return (np.array([estimate_sample_lng, estimate_sample_lat, np.clip(estimate_cost, 0, None)])
            .T.reshape(-1, 3))


def format_data(data):
    """
    :param data: A Nx3 matrix, represented as a 2d array, of [lat, lng, cost]
    :return: An array of Nx1 matrices representing each column of the input
    """
    np_data = np.array(data, np.float64)
    np_data = np_data[~np.isnan(np_data).any(axis=1)]  # remove rows with NaN
    return [column.reshape(-1, 1) for column in np_data.T]
