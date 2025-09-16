const path = require('path');
const fs = require('fs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Fonction pour récupérer tous les fichiers `.ts` dans un dossier donné
const getEntries = (dir) => {
    const entries = {};
    fs.readdirSync(dir).forEach((file) => {
        if (file.endsWith('.ts')) {
            const name = file.replace('.ts', ''); // Supprime l'extension pour le nom d'entrée
            entries[name] = path.resolve(dir, file);
        }
    });
    return entries;
};

module.exports = {
    entry: {
        popup: './src/popup.ts',
        background: './src/background.ts',
        content: './src/content.ts',
        options: './src/options.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public', to: 'public' },
                { from: 'manifest.json', to: '.' },
                { from: 'rules.json', to: '.' },
                {
                    from: './src/data/chat-suggestion.json',
                    to: './data',
                },
            ],
        }),
    ],
    devtool: 'cheap-source-map',
    mode: 'development',
};
