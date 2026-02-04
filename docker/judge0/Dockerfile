# Custom Judge0 CE with Python ML packages (numpy, pandas, scikit-learn, scipy)
# Based on Judge0 CE 1.13.1
#
# Build: docker build -t practix/judge0:1.13.1-ml .
#
# This image extends the standard Judge0 CE with ML packages while keeping
# all original languages (Go, Java, JavaScript, TypeScript, Rust, etc.)

FROM judge0/judge0:1.13.1

# Judge0 runs as user judge0 (uid=1000), home=/home/judge0
# Install pip and ML packages to user's home directory, then copy to system site-packages
ENV PYTHONUSERBASE=/home/judge0/.local
ENV PATH="/home/judge0/.local/bin:$PATH"

# Download and install new pip, then install ML packages
RUN curl -sS https://bootstrap.pypa.io/pip/3.8/get-pip.py -o /tmp/get-pip.py && \
    /usr/local/python-3.8.1/bin/python3 /tmp/get-pip.py --user && \
    /home/judge0/.local/bin/pip install --user --no-cache-dir \
        'numpy<2.0' \
        'pandas<2.0' \
        'scikit-learn<1.3' \
        'scipy<1.11' \
        'matplotlib<3.8' && \
    rm /tmp/get-pip.py

# Copy installed packages to system site-packages so sandbox can access them
# Judge0 sandbox doesn't have access to user site-packages
USER root
RUN cp -r /home/judge0/.local/lib/python3.8/site-packages/* /usr/local/python-3.8.1/lib/python3.8/site-packages/ && \
    chown -R judge0:judge0 /usr/local/python-3.8.1/lib/python3.8/site-packages/
USER judge0

# Verify installation works from system path
RUN /usr/local/python-3.8.1/bin/python3 -c "import numpy; print(f'NumPy {numpy.__version__} installed')"
