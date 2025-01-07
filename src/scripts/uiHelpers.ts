export const toggleUIElements = {
    showLoading: () => {
        document.getElementById('loading')!.style.display = 'block';
        document.getElementById('error')!.style.display = 'none';
        document.getElementById('recipeResult')!.style.display = 'none';
        document.getElementById('submitButton')!.setAttribute('disabled', 'true');
    },

    hideLoading: () => {
        document.getElementById('loading')!.style.display = 'none';
        document.getElementById('submitButton')!.removeAttribute('disabled');
    },

    showError: (message: string) => {
        const errorElement = document.getElementById('error')!;
        errorElement.textContent = `Error: ${message}`;
        errorElement.style.display = 'block';
    },

    showResult: () => {
        document.getElementById('recipeResult')!.style.display = 'grid';
    }
};