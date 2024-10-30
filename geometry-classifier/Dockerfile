FROM tensorflow/tensorflow:latest-gpu-jupyter

RUN pip install --no-cache-dir --upgrade pip

RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

WORKDIR /workspace

COPY requirements.txt .

RUN pip install -r /workspace/requirements.txt


# Expose port for Jupyter
EXPOSE 8888

# Optionally create an entrypoint or start Jupyter automatically
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--allow-root"]
