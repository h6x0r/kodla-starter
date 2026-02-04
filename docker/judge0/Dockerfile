# Custom Judge0 CE with Python ML packages (numpy, pandas, scikit-learn, scipy)
# Based on Judge0 CE 1.13.1
#
# Build: docker build -t practix/judge0:1.13.1-ml .
#
# This image extends the standard Judge0 CE with ML packages while keeping
# all original languages (Go, Java, JavaScript, TypeScript, Rust, etc.)

FROM judge0/judge0:1.13.1

# Install Python ML packages using Judge0's Python
# Judge0 uses Python in /usr/local/python-3.8.1/bin/python3
RUN /usr/local/python-3.8.1/bin/python3 -m pip install --upgrade pip && \
    /usr/local/python-3.8.1/bin/python3 -m pip install \
        numpy \
        pandas \
        scikit-learn \
        scipy \
        matplotlib \
    && rm -rf /root/.cache/pip

# Verify installation
RUN /usr/local/python-3.8.1/bin/python3 -c "import numpy; print(f'NumPy {numpy.__version__} installed')"
